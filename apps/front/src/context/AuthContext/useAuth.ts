import { useContext } from 'react';
import { AuthContext } from '.';

export const useAuth = () => {
    const result = useContext(AuthContext);
    if (!result) throw new Error('Auth context not found');
    return result;
};