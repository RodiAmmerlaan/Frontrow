import React, { useEffect, useState } from 'react';
import api from '../utils/api';

interface Props {
    accessToken: string,
    onLogout: () => void;
}

interface Message {
    message: string;
}

function ProtectedPage({ accessToken, onLogout }: Props) {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchSecret = async () => {
            try {
                const res = await api.get<Message>("/secret");
                setMessage(res.data.message);
            } catch (error) {
                setMessage('Toegang geweigerd: ' + error);
            }
        };

        fetchSecret();
    }, [accessToken])

    return (
        <div>
            <h2>Beveiligde pagina</h2>
            <p>{message}</p>
            <button onClick={onLogout}>Uitloggen</button>
        </div>
    )
}

export default ProtectedPage;