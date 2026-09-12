import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export enum PaymentMethod {
  USDT_TRC20 = 'USDT_TRC20',
  USDT_ERC20 = 'USDT_ERC20',
  BTC = 'BTC',
  ETH = 'ETH',
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX',
}

export class DepositDto {
  @IsNumber()
  @IsPositive()
  @Min(10, { message: 'Minimum deposit is $10' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  bonusCode?: string;
}

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  @Min(20, { message: 'Minimum withdrawal is $20' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Invalid payout method' })
  method: PaymentMethod;

  @IsString()
  destinationAddress: string;
}
