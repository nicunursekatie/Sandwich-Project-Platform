// Simple test App to verify React is working
export default function App() {
  return (
    <div style={{padding: '20px'}}>
      <h1>React App is Working!</h1>
      <p>Gmail inbox has been simplified without threading.</p>
      <p>Server time: {new Date().toISOString()}</p>
      <button onClick={() => window.location.href = '/api/login'}>
        Login to Access Gmail Inbox
      </button>
    </div>
  );
}