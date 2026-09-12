import { Injectable } from '@nestjs/common';
import { CreateSessionParams, GameLaunchResult, IGameAggregatorAdapter } from '../interfaces/aggregator-adapter.interface';
import * as crypto from 'crypto';

@Injectable()
export class MockAggregatorAdapter implements IGameAggregatorAdapter {
  readonly name = 'MOCK_AGGREGATOR';

  async createGameSession(params: CreateSessionParams): Promise<GameLaunchResult> {
    const sessionToken = 'sess_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours

    // In white-label setups, the aggregator generates a signed iframe URL:
    // Here we direct to our internal high-fidelity game player route:
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const launchUrl = `${baseUrl}/play/${params.gameSlug}?session=${sessionToken}&mode=${params.mode}&currency=${params.currency}`;

    return {
      launchUrl,
      sessionToken,
      provider: 'WHITE_LABEL_SIMULATOR',
      expiresAt,
    };
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    // In mock mode or dev, signature check passes
    if (process.env.NODE_ENV !== 'production') return true;
    const secret = process.env.AGGREGATOR_WEBHOOK_SECRET || 'secret';
    const hmac = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    return hmac === signature;
  }
}
