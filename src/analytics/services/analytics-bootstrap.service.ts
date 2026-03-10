import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { analyticsEnv } from '../analytics-env';
import { AnalyticsRepository } from '../analytics.repository';

@Injectable()
export class AnalyticsBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsBootstrapService.name);

  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async onModuleInit(): Promise<void> {
    const analytics = analyticsEnv;
    const entries: [string, string, string][] = [
      [
        'project_id',
        analytics.projectId,
        'Identificador textual del microservicio',
      ],
      [
        'project_id_numeric',
        String(analytics.projectIdNumeric),
        'Identificador numérico asignado al proyecto',
      ],
      ['project_type', analytics.projectType, 'Tipo de dominio del proyecto'],
      [
        'db_engine',
        analytics.dbEngine,
        'Motor de base de datos para analytics',
      ],
      ['db_version', analytics.dbVersion, 'Versión del motor PostgreSQL'],
      [
        'index_strategy',
        analytics.indexStrategy,
        'Estrategia de indexación actual',
      ],
      [
        'bigquery_project',
        analytics.bigQueryProjectId,
        'Proyecto destino en BigQuery',
      ],
      [
        'bigquery_dataset',
        analytics.bigQueryDataset,
        'Dataset destino en BigQuery',
      ],
      ['bigquery_table', analytics.bigQueryTable, 'Tabla destino en BigQuery'],
      [
        'registered_email',
        analytics.registeredEmail,
        'Correo asociado al experimento',
      ],
      [
        'registered_date',
        analytics.registeredDate,
        'Fecha de registro del experimento',
      ],
    ];

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      try {
        await this.analyticsRepository.healthCheck();

        for (const [name, value, description] of entries) {
          await this.analyticsRepository.upsertExperimentConfig(
            name,
            value,
            description,
          );
        }

        this.logger.log('Analytics bootstrap config sincronizada');
        return;
      } catch (error) {
        this.logger.warn(
          `No se pudo sincronizar analytics en intento ${attempt}: ${error instanceof Error ? error.message : String(error)}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    this.logger.error(
      'Analytics quedó habilitado pero no pudo sincronizarse con PostgreSQL tras varios intentos',
    );
  }
}
