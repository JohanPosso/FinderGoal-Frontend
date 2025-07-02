import { useState, useCallback } from 'react';
import { sendWelcomeEmail, sendCustomEmail } from './emailService';

export const useEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendWelcome = useCallback(async (email, userName) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendWelcomeEmail(email, userName);
      
      if (result.success) {
        setSuccess(true);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado al enviar el correo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendCustom = useCallback(async (to, subject, html) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendCustomEmail(to, subject, html);
      
      if (result.success) {
        setSuccess(true);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado al enviar el correo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendBulk = useCallback(async (emails, subject, html) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const email of emails) {
        const result = await sendCustomEmail(email, subject, html);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push({ email, error: result.error });
        }
      }

      if (errorCount === 0) {
        setSuccess(true);
        return { 
          success: true, 
          data: { successCount, errorCount: 0 },
          message: `Todos los correos (${successCount}) fueron enviados exitosamente`
        };
      } else {
        const message = `${successCount} correos enviados, ${errorCount} fallaron`;
        setError(message);
        return { 
          success: false, 
          error: message,
          data: { successCount, errorCount, errors }
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado al enviar los correos';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isLoading,
    error,
    success,
    sendWelcome,
    sendCustom,
    sendBulk,
    clearState
  };
}; 