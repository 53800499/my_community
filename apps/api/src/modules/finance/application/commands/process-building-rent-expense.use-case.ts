import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FINANCE_READER_PORT,
  type FinanceReaderPort,
} from '../ports/finance-reader.port.js';
import {
  FINANCE_WRITER_PORT,
  type FinanceWriterPort,
} from '../ports/finance-writer.port.js';
import { BuildingRentExpenseEntity } from '../../domain/entities/building-rent-expense.entity.js';

export interface ProcessBuildingRentExpenseCommand {
  leaseId: string;
  monthYear: string; // 'YYYY-MM'
  dueDate?: Date;
}

@Injectable()
export class ProcessBuildingRentExpenseUseCase {
  constructor(
    @Inject(FINANCE_READER_PORT)
    private readonly reader: FinanceReaderPort,
    @Inject(FINANCE_WRITER_PORT)
    private readonly writer: FinanceWriterPort,
  ) {}

  public async execute(command: ProcessBuildingRentExpenseCommand): Promise<BuildingRentExpenseEntity> {
    const lease = await this.reader.findBuildingLeaseById(command.leaseId);
    if (!lease) {
      throw new NotFoundException(`Bail introuvable avec l'identifiant: ${command.leaseId}`);
    }

    // Check if expense already generated for this month
    const existingExpenses = await this.reader.listRentExpenses({
      leaseId: command.leaseId,
      monthYear: command.monthYear,
    });
    if (existingExpenses.length > 0) {
      throw new ConflictException(`L'échéance de loyer pour ${command.monthYear} a déjà été générée.`);
    }

    // Calculate due date based on paymentDayOfMonth
    const [yearStr, monthStr] = command.monthYear.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const dueDate = command.dueDate ?? new Date(year, month, lease.paymentDayOfMonth);

    const expense = BuildingRentExpenseEntity.create({
      leaseId: lease.id,
      monthYear: command.monthYear,
      amount: lease.monthlyRentAmount,
      dueDate,
    });

    await this.writer.saveRentExpense(expense);

    return expense;
  }
}
