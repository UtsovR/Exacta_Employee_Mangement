import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            setSocket(null);
            return undefined;
        }

        const newSocket = io('/', {
            path: '/socket.io',
            auth: {
                token: `Bearer ${token}`,
            },
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
            setSocket(null);
        };
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
