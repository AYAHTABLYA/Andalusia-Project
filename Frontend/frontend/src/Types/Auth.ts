// Mirrors Andalusia.Shared.Dtos.AuthDtos.AuthResponseDto (camelCase over the wire).
type AuthResponse = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
};

export type { AuthResponse };
