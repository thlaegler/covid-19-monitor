package com.covid19.graphql;

import org.reactivestreams.Publisher;
import org.reactivestreams.Subscriber;
import org.springframework.stereotype.Service;
import com.coxautodev.graphql.tools.GraphQLSubscriptionResolver;
import io.leangen.graphql.annotations.GraphQLSubscription;
import lombok.extern.slf4j.Slf4j;

/**
 * SubscriptionDummy
 */
@Slf4j
@Service
public class Subscription implements GraphQLSubscriptionResolver {

  @GraphQLSubscription
  public Publisher<String> test() {
    return new Publisher<String>() {
      @Override
      public void subscribe(Subscriber<? super String> s) {
        log.debug("Got a subscription");
        s.onNext("test");
      }
    };
  }

}
