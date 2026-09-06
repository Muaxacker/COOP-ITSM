import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './env';
import { JwtPayload } from '../types';

let io: SocketIOServer | null = null;

export interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

export function initSocket(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all origins in dev or matching client URLs
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // JWT authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      socket.user = decoded;
      next();
    } catch (err: any) {
      next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) return;

    // Join specific user channel
    socket.join(`user:${user.userId}`);

    // Join role channel (e.g. role:IT_SUPERVISOR, role:TECHNICIAN)
    socket.join(`role:${user.role}`);

    // Join branch channel if applicable
    if (user.branchId) {
      socket.join(`branch:${user.branchId}`);
    }

    // Join division channel if applicable
    if (user.divisionId) {
      socket.join(`division:${user.divisionId}`);
    }

    // Join global authenticated staff room
    socket.join('authenticated_staff');

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: any): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToRole(role: string, event: string, payload: any): void {
  if (!io) return;
  io.to(`role:${role}`).emit(event, payload);
}

export function emitToDivision(divisionId: string, event: string, payload: any): void {
  if (!io) return;
  io.to(`division:${divisionId}`).emit(event, payload);
}

export function emitToBranch(branchId: string, event: string, payload: any): void {
  if (!io) return;
  io.to(`branch:${branchId}`).emit(event, payload);
}

export function broadcastEvent(event: string, payload: any): void {
  if (!io) return;
  io.to('authenticated_staff').emit(event, payload);
}

