
import axios from 'axios';
import { env } from '../config/env';

const API_URL = 'http://localhost:5000/api';

async function testAuthFlow() {
    console.log('--- STARTING AUTH FLOW TEST ---');
    const email = `test_${Date.now()}@example.com`;
    const password = 'Password123!';
    const fullName = 'Test User';

    try {
        // 1. Register
        console.log(`[1] Registering user: ${email}`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            fullName,
            acceptTerms: true
        });

        if (regRes.status === 201) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed', regRes.data);
            return;
        }

        // 2. Login
        console.log(`[2] Logging in...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        if (loginRes.status === 200 && loginRes.data.data.accessToken) {
            console.log('✅ Login Successful');
            console.log('Token received:', loginRes.data.data.accessToken.substring(0, 20) + '...');
        } else {
            console.error('❌ Login Failed', loginRes.data);
            return;
        }

        const token = loginRes.data.data.accessToken;

        // 3. Protected Route (Get Me)
        console.log(`[3] Accessing Protected Route (/auth/me)...`);
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (meRes.status === 200 && meRes.data.data.email === email) {
            console.log('✅ Protected Route Access Successful');
            console.log('User identity verified:', meRes.data.data.email);
        } else {
            console.error('❌ Protected Route Failed', meRes.data);
        }

    } catch (error: any) {
        console.error('❌ TEST FAILED');
        if (error.code) console.error('Error Code:', error.code);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
            console.error('Full Error:', error);
        }
    }
    console.log('--- TEST COMPLETE ---');
}

testAuthFlow();
