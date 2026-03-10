import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics.repository';
import { PREDEFINED_ANALYTICS_QUERIES } from '../predefined-queries';

@Injectable()
export class WorkloadService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async runSyntheticWorkload(iterations = 10) {
    let executedQueries = 0;

    for (let iteration = 1; iteration <= iterations; iteration += 1) {
      for (const definition of PREDEFINED_ANALYTICS_QUERIES) {
        const params = this.getParams(definition.queryName, iteration);
        await this.analyticsRepository.executeQuery(definition.sql, params);
        executedQueries += 1;
      }
    }

    return {
      iterations,
      executedQueries,
      queryNames: PREDEFINED_ANALYTICS_QUERIES.map((query) => query.queryName),
    };
  }

  async resetStats() {
    await this.analyticsRepository.resetPgStatStatements();
  }

  private getParams(queryName: string, iteration: number): unknown[] {
    const userId = ((iteration * 7 - 1) % 80) + 1;
    const postId = ((iteration * 11 - 1) % 800) + 1;
    const eventId = ((iteration * 13 - 1) % 250) + 1;
    const limit = 10 + (iteration % 15);
    const offset = iteration % 20;

    switch (queryName) {
      case 'posts_list_paginated':
      case 'events_list_paginated':
        return [limit, offset];
      case 'posts_by_user':
      case 'events_by_user':
      case 'attendance_by_user':
      case 'reviews_by_user':
      case 'saved_posts_by_user':
        return [userId, limit];
      case 'post_find_one':
      case 'reactions_by_post':
        return [postId];
      case 'posts_soft_delete_user':
      case 'events_upcoming':
      case 'events_recent':
      case 'saved_posts_top':
        return [limit];
      case 'event_find_one':
      case 'reviews_by_event':
      case 'attendance_status_count':
        return [eventId];
      case 'attendance_by_event':
        return [eventId, limit];
      case 'posts_count_active':
        return [];
      default:
        return [];
    }
  }
}
