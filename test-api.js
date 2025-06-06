// Simple test script to verify the API endpoint
const testWorkflowGeneration = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Send an email notification when a new form submission is received',
      }),
    });

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

testWorkflowGeneration(); 