
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/login';
const CREDENTIALS = {
    email: 'varadnakhate289@gmail.com',
    password: 'password123'
};

async function testLogin() {
    console.log(`Testing Login API: ${API_URL}`);
    console.log(`Payload:`, CREDENTIALS);

    try {
        const response = await axios.post(API_URL, CREDENTIALS);
        console.log('✅ Login SUCCESS!');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error: any) {
        console.error('❌ Login FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
