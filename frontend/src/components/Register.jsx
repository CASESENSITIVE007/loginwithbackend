import { useState } from "react";
const Register = () => {
    const [user, setUser] = useState({
      username: '',
      fullName: '',
      email: '',
      password: ''
    });
  
    const handleChange = (e) => {
      setUser({
        ...user,
        [e.target.name]: e.target.value
      });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('User Details:', user);
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Register</h2>
          <form className="mt-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                name="username"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter your username" 
                value={user.username} 
                onChange={handleChange} 
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter your full name" 
                value={user.fullName} 
                onChange={handleChange} 
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                name="email"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter your email" 
                value={user.email} 
                onChange={handleChange} 
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                name="password"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter your password" 
                value={user.password} 
                onChange={handleChange} 
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default Register;