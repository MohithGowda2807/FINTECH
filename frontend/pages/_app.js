import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import FinanceChatbot from '../components/FinanceChatbot'; // ADD THIS

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <FinanceChatbot /> {/* ADD THIS */}
    </AuthProvider>
  );
}

export default MyApp;
