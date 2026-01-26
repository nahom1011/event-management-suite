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
            <div className="max-w-3xl mx-auto py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' :
                                    step > s ? 'bg-emerald-500 text-white' : 'bg-white/5 text-text-dim border border-white/10'
                                    }`}>
                                    {step > s ? <CheckCircle2 size={16} /> : s}
                                </div>
                                {s < 3 && <div className={`h-1 w-12 rounded ${step > s ? 'bg-emerald-500' : 'bg-white/5'}`} />}
                            </div>
                        ))}
                    </div>
                    <h1 className="text-5xl font-black tracking-tight">
                        {step === 1 ? "The Basics" : step === 2 ? "When & Where?" : "Ticketing"}
                    </h1>
                    <p className="text-text-dim mt-2">
                        {step === 1 ? "Tell us what your event is all about." :
                            step === 2 ? "Set the schedule and location for your guests." :
                                "Define your ticket types and inventory."}
                    </p>
                </div>

                <div className="glass-morphism p-8 rounded-radius-xl relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-text-dim flex items-center gap-2">
                                        <Info size={14} /> Event Title
                                    </label>
                                    <input
                                        name="title"
                                        value={eventData.title}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 outline-none focus:border-primary/50 transition-all font-semibold text-lg"
                                        placeholder="e.g. Summer Music Jam 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-text-dim flex items-center gap-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={5}
                                        value={eventData.description}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 outline-none focus:border-primary/50 transition-all font-medium"
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
                                        <label className="block text-sm font-bold mb-2 text-text-dim flex items-center gap-2">
                                            <Calendar size={14} /> Start Date
                                        </label>
                                        <input
                                            name="startDate"
                                            type="date"
                                            value={eventData.startDate}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-text-dim flex items-center gap-2">
                                            <Clock size={14} /> Start Time
                                        </label>
                                        <input
                                            name="startTime"
                                            type="time"
                                            value={eventData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-text-dim flex items-center gap-2">
                                            <Calendar size={14} /> End Date
                                        </label>
                                        <input
                                            name="endDate"
                                            type="date"
                                            value={eventData.endDate}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-text-dim flex items-center gap-2">
                                            <Clock size={14} /> End Time
                                        </label>
                                        <input
                                            name="endTime"
                                            type="time"
                                            value={eventData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-text-dim flex items-center gap-2">
                                        <MapPin size={14} /> Location
                                    </label>
                                    <input
                                        name="location"
                                        value={eventData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 outline-none focus:border-primary/50 transition-all font-medium"
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
                                className="space-y-6"
                            >
                                {tickets.map((t, i) => (
                                    <div key={i} className="p-6 bg-white/5 rounded-radius-lg border border-white/10 relative group">
                                        {tickets.length > 1 && (
                                            <button
                                                onClick={() => removeTicket(i)}
                                                className="absolute top-4 right-4 text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold mb-2 text-text-dim uppercase tracking-wider">Ticket Name</label>
                                                <input
                                                    value={t.type}
                                                    onChange={(e) => updateTicket(i, 'type', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-all"
                                                    placeholder="e.g. Early Bird"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-2 text-text-dim uppercase tracking-wider">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={t.price}
                                                    onChange={(e) => updateTicket(i, 'price', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-2 text-text-dim uppercase tracking-wider">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={t.quantity}
                                                    onChange={(e) => updateTicket(i, 'quantity', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addTicket}
                                    className="w-full border-2 border-dashed border-white/10 p-4 rounded-radius-lg text-text-dim flex items-center justify-center gap-2 hover:bg-white/5 transition-all font-bold"
                                >
                                    <Plus size={18} /> Add Another Ticket Type
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 text-text-dim hover:text-white transition-colors font-bold"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="bg-white text-bg px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || success}
                                className={`px-10 py-3 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl ${success ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-primary/25 hover:bg-indigo-600'
                                    }`}
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
