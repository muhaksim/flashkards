async function registerUser(userData) {
    const existingUser = await checkUserExists(userData.email);
  
    if (!existingUser) {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: generateUniqueId(),
          email: userData.email,
          full_name: userData.fullName,
        }),
      });
  
      if (response.ok) {
        return 'User registered successfully';
      } else {
        throw new Error('Failed to register user');
      }
    } else {
      return 'User already exists';
    }
  }
  
  async function checkUserExists(email) {
    const response = await fetch('/api/v1/users');
    const users = await response.json();
    return users.some(user => user.email === email);
  }
  
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  export { registerUser };
  