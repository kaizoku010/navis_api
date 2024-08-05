import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AWSContext = createContext();

export const useAWS = () => useContext(AWSContext);

export const AWSProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [allTrucks, setAllTrucks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [nonUserRequests, setNonUserRequests] = useState([]);

  const endpoint = 'https://navis-api.onrender.com'; // Replace with your actual API endpoint

  const fetchDeliveriesFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/deliveries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNonUserDeliveries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/non-user-deliveries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setNonUserRequests(data);
    } catch (error) {
      console.error("Error fetching non-user requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriversFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/drivers?company=${user?.company}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (uid, status) => {
    try {
      await fetch(`/deliveries/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  const saveNonUserRequests = async (reqData) => {
    setLoading(true);
    try {
      await fetch(`/non-user-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: uuidv4(), ...reqData }),
      });
    } catch (error) {
      console.error("Error saving request data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDriverDataToAPI = async (driverData) => {
    setLoading(true);
    try {
      await fetch(`${endpoint}/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });
    } catch (error) {
      console.error("Error saving driver data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrucksFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}/trucks?company=${user?.company}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setTrucks(data);
    } catch (error) {
      console.error("Error fetching trucks:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTrucks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}/trucks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setAllTrucks(data);
    } catch (error) {
      console.error("Error fetching all trucks:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTruckDataToAPI = async (truckData) => {
    setLoading(true);
    try {
      await fetch(`${endpoint}/trucks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckData),
      });
    } catch (error) {
      console.error("Error saving truck data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}/users?username=${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const user = data.find(user => user.password === password);
      setUser(user);
      return user;
    } catch (error) {
      console.error("Error logging in user:", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToS3 = async (file) => {
    const reader = new FileReader();
  
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; // Remove the data URL prefix
        
        try {
          // Replace with your actual S3 upload endpoint
          const response = await fetch('https://your-s3-upload-endpoint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64data }),
          });
  
          const data = await response.json();
          resolve(data.imageUrl); // Return the URL of the uploaded image
        } catch (error) {
          reject(error);
        }
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsDataURL(file); // Convert file to Base64
    });
  };

  const registerUser = async (username, email, company, password, accountType, imageFile) => {
    setLoading(true);
    try {
      const imageUrl = await uploadImageToS3(imageFile); // Implement your image upload logic here
      const userData = { username, email, company, password, accountType, imageUrl };
      await fetch(`${endpoint}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      setUser(userData);
    } catch (error) {
      console.error("Error registering user:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    user,
    trucks,
    allTrucks,
    requests,
    drivers,
    assignments,
    deliveries,
    nonUserRequests,
    fetchDeliveriesFromAPI,
    fetchNonUserDeliveries,
    fetchDriversFromAPI,
    updateDeliveryStatus,
    saveNonUserRequests,
    saveDriverDataToAPI,
    fetchTrucksFromAPI,
    fetchAllTrucks,
    saveTruckDataToAPI,
    loginUser,
    registerUser,
  };

  return <AWSContext.Provider value={value}>{children}</AWSContext.Provider>;
};
