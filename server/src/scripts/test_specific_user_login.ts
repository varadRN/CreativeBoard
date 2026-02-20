
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testSpecificUserLogin() {
    console.log('--- STARTING SPECIFIC USER LOGIN TEST ---');
    const email = 'varadnakhate289@gmail.com';
    const password = 'password123';

    try {
        console.log(`[1] Logging in as ${email}...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        if (loginRes.status === 200 && loginRes.data.data.accessToken) {
            console.log('✅ Login Successful');
            console.log('Token received:', loginRes.data.data.accessToken.substring(0, 20) + '...');
        } else {
            console.error('❌ Login Failed', loginRes.data);
        }

    } catch (error: any) {
        console.error('❌ TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
    console.log('--- TEST COMPLETE ---');
}

testSpecificUserLogin();
