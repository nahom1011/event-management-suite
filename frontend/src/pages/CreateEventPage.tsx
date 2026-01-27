import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    Calendar, MapPin, Plus, Trash2,
    ArrowRight, ArrowLeft, Send, CheckCircle2,
    Info, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CreateEventPage.css';

const CreateEventPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        location: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
    });

    const [tickets, setTickets] = useState([
        { type: 'General Admission', price: 0, quantity: 100 }
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEventData({ ...eventData, [e.target.name]: e.target.value });
    };

    const addTicket = () => {
        setTickets([...tickets, { type: '', price: 0, quantity: 10 }]);
    };

    const removeTicket = (index: number) => {
        setTickets(tickets.filter((_, i) => i !== index));
    };

    const updateTicket = (index: number, field: string, value: any) => {
        const newTickets = [...tickets];
        (newTickets[index] as any)[field] = value;
        setTickets(newTickets);
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!eventData.title || eventData.title.length < 3) {
            alert("Title must be at least 3 characters.");
            return;
        }
        if (!eventData.startDate || !eventData.startTime || !eventData.endDate || !eventData.endTime) {
            alert("Please fill in all date and time windows.");
            return;
        }
        if (tickets.some(t => !t.type || t.quantity < 1)) {
            alert("Please ensure all tickets have a type and a valid quantity.");
            return;
        }

        setLoading(true);
        try {
            const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`).toISOString();
            const endDateTime = new Date(`${eventData.endDate}T${eventData.endTime}`).toISOString();

            await api.post('/events', {
                ...eventData,
                startDate: startDateTime,
                endDate: endDateTime,
                tickets: tickets.map(t => ({
                    ...t,
                    price: Number(t.price),
                    quantity: Number(t.quantity)
                }))
            });

            setSuccess(true);
            setTimeout(() => navigate('/organizer'), 2000);
        } catch (error: any) {
            console.error('Creation failed:', error);
            const message = error.response?.data?.message || error.message || 'Something went wrong. Please check your data.';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="create-event-container">
                <div className="create-event-header">
                    <div className="progress-bar">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="step-indicator">
                                <div className={`step-circle ${step === s ? 'step-circle-active' :
                                    step > s ? 'step-circle-completed' : 'step-circle-inactive'
                                    }`}>
                                    {step > s ? <CheckCircle2 size={16} /> : s}
                                </div>
                                {s < 3 && <div className={`step-line ${step > s ? 'step-line-active' : 'step-line-inactive'}`} />}
                            </div>
                        ))}
                    </div>
                    <h1 className="page-title">
                        {step === 1 ? "The Basics" : step === 2 ? "When & Where?" : "Ticketing"}
                    </h1>
                    <p className="page-description">
                        {step === 1 ? "Tell us what your event is all about." :
                            step === 2 ? "Set the schedule and location for your guests." :
                                "Define your ticket types and inventory."}
                    </p>
                </div>

                <div className="form-card">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="form-section"
                            >
                                <div>
                                    <label className="form-label-create">
                                        <Info size={14} /> Event Title
                                    </label>
                                    <input
                                        name="title"
                                        value={eventData.title}
                                        onChange={handleInputChange}
                                        className="form-input-create"
                                        placeholder="e.g. Summer Music Jam 2026"
                                    />
                                </div>
                                <div>
                                    <label className="form-label-create">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={5}
                                        value={eventData.description}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        placeholder="What should people expect from this event?"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="form-label-create">
                                            <Calendar size={14} /> Start Date
                                        </label>
                                        <input
                                            name="startDate"
                                            type="date"
                                            value={eventData.startDate}
                                            onChange={handleInputChange}
                                            className="form-input-create"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label-create">
                                            <Clock size={14} /> Start Time
                                        </label>
                                        <input
                                            name="startTime"
                                            type="time"
                                            value={eventData.startTime}
                                            onChange={handleInputChange}
                                            className="form-input-create"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="form-label-create">
                                            <Calendar size={14} /> End Date
                                        </label>
                                        <input
                                            name="endDate"
                                            type="date"
                                            value={eventData.endDate}
                                            onChange={handleInputChange}
                                            className="form-input-create"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label-create">
                                            <Clock size={14} /> End Time
                                        </label>
                                        <input
                                            name="endTime"
                                            type="time"
                                            value={eventData.endTime}
                                            onChange={handleInputChange}
                                            className="form-input-create"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label-create">
                                        <MapPin size={14} /> Location
                                    </label>
                                    <input
                                        name="location"
                                        value={eventData.location}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        placeholder="e.g. Grand Plaza, Downtown"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="form-section"
                            >
                                {tickets.map((t, i) => (
                                    <div key={i} className="ticket-card">
                                        {tickets.length > 1 && (
                                            <button
                                                onClick={() => removeTicket(i)}
                                                className="remove-ticket-btn"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <div className="ticket-grid">
                                            <div className="col-span-1">
                                                <label className="ticket-label">Ticket Name</label>
                                                <input
                                                    value={t.type}
                                                    onChange={(e) => updateTicket(i, 'type', e.target.value)}
                                                    className="ticket-input"
                                                    placeholder="e.g. Early Bird"
                                                />
                                            </div>
                                            <div>
                                                <label className="ticket-label">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={t.price}
                                                    onChange={(e) => updateTicket(i, 'price', e.target.value)}
                                                    className="ticket-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="ticket-label">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={t.quantity}
                                                    onChange={(e) => updateTicket(i, 'quantity', e.target.value)}
                                                    className="ticket-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addTicket}
                                    className="add-ticket-btn"
                                >
                                    <Plus size={18} /> Add Another Ticket Type
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="nav-bar">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="back-btn"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="next-btn"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || success}
                                className={`submit-btn-create ${success ? 'submit-btn-success' : 'submit-btn-default'}`}
                            >
                                {success ? (
                                    <>Saved! <CheckCircle2 size={18} /></>
                                ) : loading ? (
                                    "Saving..."
                                ) : (
                                    <>Publish Event <Send size={18} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CreateEventPage;
