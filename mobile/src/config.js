import { Platform } from 'react-native';

const DEV_API_URL = 'http://localhost:5000/api';
const PROD_API_URL = 'https://your-production-url.com/api';

const ANDROID_EMULATOR_URL = 'http://10.0.2.2:5000/api';

let API_URL = DEV_API_URL;

if (__DEV__) {
  API_URL = Platform.OS === 'android' ? ANDROID_EMULATOR_URL : DEV_API_URL;
} else {
  API_URL = PROD_API_URL;
}

export { API_URL };
