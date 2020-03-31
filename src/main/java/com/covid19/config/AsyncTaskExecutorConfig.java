package com.covid19.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@EnableAsync(proxyTargetClass = true)
@Configuration
public class AsyncTaskExecutorConfig implements AsyncConfigurer {

  /**
   * Default async Task executor
   */
  @Override
  public Executor getAsyncExecutor() {
    return covid19AsyncTaskExecutor();
  }

  @Bean(name = "covid19AsyncTaskExecutor")
  public Executor covid19AsyncTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setAllowCoreThreadTimeOut(true);
    executor.setThreadNamePrefix("covid19AsyncTaskExecutor-");

    // TODO: if this works move those values into cloud config
    executor.setMaxPoolSize(65000);
    executor.setQueueCapacity(65000);

    executor.setAwaitTerminationSeconds(10);

    executor.initialize();

    return executor;
  }

}
