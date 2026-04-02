import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketTypeResponseDto } from './dto/ticket-type-response.dto';
import {
  mapTicketTypeToResponseDto,
  mapTicketTypesToResponseDto,
} from './mappers/ticket-type.mapper';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { PaginatedResponse } from 'src/common';

@Controller('ticket-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createTicketTypeDto: CreateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    const ticketType =
      await this.ticketTypesService.create(createTicketTypeDto);
    return mapTicketTypeToResponseDto(ticketType);
  }

  @Get()
  @Public()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<PaginatedResponse<TicketTypeResponseDto>> {
    const ticketTypes = await this.ticketTypesService.findAll();
    const total = ticketTypes.length;
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 10;
    const skip = (safePage - 1) * safeLimit;
    const pagedItems = ticketTypes.slice(skip, skip + safeLimit);
    const data = mapTicketTypesToResponseDto(pagedItems);

    return {
      items: data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  @Get('deleted')
  @Roles(UserRole.ADMIN)
  async findAllWithDeleted(): Promise<TicketTypeResponseDto[]> {
    const ticketTypes = await this.ticketTypesService.findAllWithDeleted();
    return mapTicketTypesToResponseDto(ticketTypes);
  }

  @Get('event/:eventId')
  @Public()
  async findByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<TicketTypeResponseDto[]> {
    const ticketTypes = await this.ticketTypesService.findByEvent(eventId);
    return mapTicketTypesToResponseDto(ticketTypes);
  }

  @Get(':id')
  @Public()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketTypeResponseDto> {
    const ticketType = await this.ticketTypesService.findById(id);
    return mapTicketTypeToResponseDto(ticketType);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    const ticketType = await this.ticketTypesService.update(
      id,
      updateTicketTypeDto,
    );
    return mapTicketTypeToResponseDto(ticketType);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketTypeResponseDto> {
    const ticketType = await this.ticketTypesService.restore(id);
    return mapTicketTypeToResponseDto(ticketType);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.ticketTypesService.softRemove(id);
  }
}
