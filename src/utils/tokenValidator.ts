interface TokenValidationResult {
  isValid: boolean;
  shouldRefresh?: boolean;
  error?: string;
}

export class TokenValidator {
  private static readonly VALIDATION_INTERVAL = 60000; // 1 minuto
  private static readonly TOKEN_EXPIRY_BUFFER = 300000; // 5 minutos antes de expirar

  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      return payload && typeof payload === 'object';
    } catch {
      return false;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp && payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  static shouldRefreshToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = Math.floor(this.TOKEN_EXPIRY_BUFFER / 1000);
      
      return payload.exp && payload.exp < (currentTime + bufferTime);
    } catch {
      return false;
    }
  }

  static async validateTokenWithServer(token: string): Promise<TokenValidationResult> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { isValid: true };
      }

      if (response.status === 401 || response.status === 403) {
        return { 
          isValid: false, 
          error: 'Token inválido o expirado' 
        };
      }

      return { 
        isValid: false, 
        error: 'Error al validar el token' 
      };
    } catch {
      return { 
        isValid: false, 
        error: 'Error de red al validar el token' 
      };
    }
  }

  static async validateToken(token: string): Promise<TokenValidationResult> {
    if (!this.validateTokenFormat(token)) {
      return { isValid: false, error: 'Formato de token inválido' };
    }

    if (this.isTokenExpired(token)) {
      return { isValid: false, error: 'Token expirado' };
    }

    if (this.shouldRefreshToken(token)) {
      const serverValidation = await this.validateTokenWithServer(token);
      return {
        ...serverValidation,
        shouldRefresh: serverValidation.isValid
      };
    }

    return { isValid: true };
  }
}