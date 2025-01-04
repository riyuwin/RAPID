import React, { useEffect, useState } from 'react';

function AddressSelect({ id, className, value, onChange, required }) {
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        // Replace with your actual API call to fetch locations
        fetch('/api/locations') // Example API call
            .then(response => response.json())
            .then(data => setAddresses(data.locations))
            .catch(error => console.error('Error fetching locations:', error));
    }, []);

    return (
        <select
            id={id}
            className={className}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
        >
            <option value="">Select Address</option>
            {addresses.map((address, index) => (
                <option key={index} value={address}>
                    {address}
                </option>
            ))}
        </select>
    );
}

export default AddressSelect;
