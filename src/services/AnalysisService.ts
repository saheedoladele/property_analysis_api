import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { AnalysisDto, CreateAnalysisDto, UpdateAnalysisDto } from "../types";

export class AnalysisService {
  private analysisRepository: AnalysisRepository;

  constructor() {
    this.analysisRepository = new AnalysisRepository();
  }

  async getAllByUserId(userId: string): Promise<AnalysisDto[]> {
    const analyses = await this.analysisRepository.findByUserId(userId);
    return analyses.map(this.toDto);
  }

  async getById(id: string, userId: string): Promise<AnalysisDto> {
    const analysis = await this.analysisRepository.findById(id, userId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }
    return this.toDto(analysis);
  }

  async create(userId: string, data: CreateAnalysisDto): Promise<AnalysisDto> {
    const analysis = await this.analysisRepository.create({
      userId,
      propertyId: data.propertyId,
      analysisData: data.analysisData,
    });

    return this.toDto(analysis);
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAnalysisDto
  ): Promise<AnalysisDto> {
    const analysis = await this.analysisRepository.findById(id, userId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    const updated = await this.analysisRepository.update(id, {
      analysisData: data.analysisData,
    });

    if (!updated) {
      throw new Error("Failed to update analysis");
    }

    return this.toDto(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const analysis = await this.analysisRepository.findById(id, userId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    const deleted = await this.analysisRepository.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete analysis");
    }
  }

  private toDto(analysis: any): AnalysisDto {
    return {
      id: analysis.id,
      propertyId: analysis.propertyId,
      userId: analysis.userId,
      analysisData: analysis.analysisData,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };
  }
}
