import axios from 'axios';

async function testCheckout() {
    const API_URL = 'http://127.0.0.1:3000/api/v1';

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'organizer@example.com',
            password: 'password123'
        });

        const token = loginRes.data.data.accessToken;
        console.log('Logged in successfully.');

        // 2. Get Events
        console.log('Fetching events...');
        const eventsRes = await axios.get(`${API_URL}/events`);
        const event = eventsRes.data.data.events[0];

        if (!event) {
            console.error('No events found.');
            return;
        }

        const ticketType = event.ticketTypes[0];
        if (!ticketType) {
            console.error('No ticket types found for event.');
            return;
        }

        console.log(`Using Event: ${event.title} (${event.id})`);
        console.log(`Using Ticket Type: ${ticketType.name} (${ticketType.id})`);

        // 3. Checkout
        console.log('Initiating checkout...');
        try {
            const checkoutRes = await axios.post(`${API_URL}/payments/checkout`, {
                eventId: event.id,
                ticketTypeId: ticketType.id,
                quantity: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Checkout Response:', JSON.stringify(checkoutRes.data, null, 2));
        } catch (checkoutError: any) {
            console.error('Checkout failed:', checkoutError.response?.data || checkoutError.message);
        }

    } catch (error: any) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testCheckout();
