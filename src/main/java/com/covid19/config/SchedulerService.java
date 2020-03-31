package com.covid19.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.covid19.service.ImportService;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
public class SchedulerService {

  private final ImportService importService;

  // Every 12 hours
  // @Scheduled(initialDelay = 10 * 1000, fixedRate = 12 * 60 * 60 * 1000)
  public void scheduleImport() {
    importService.importAllDailyReports(null);
  }

}
