package com.covid19.service;

import static java.math.BigDecimal.ONE;
import static java.math.BigDecimal.ZERO;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class SeirPandemicModel {

  // Explizites Euler-Verfahren
  private Map<BigDecimal, BigDecimal[]> euler_method(BigDecimal beta, BigDecimal gamma,
      BigDecimal a, BigDecimal t0, BigDecimal[] x0, BigDecimal t1, BigDecimal h) {
    BigDecimal t = t0;
    BigDecimal[] x = x0;
    Map<BigDecimal, BigDecimal[]> a2 = new HashMap<>();
    a2.put(t, x);
    for (BigDecimal k = ZERO; ONE.add(t1.subtract(t0).divide(h)).compareTo(k) < 0; k.add(ONE)) {
      t = t0.add(k.multiply(h));
      BigDecimal[] seir = SEIR_model(beta, gamma, a, t, x);
      x[0] = x[0].add(h.multiply(seir[0]));
      x[1] = x[1].add(h.multiply(seir[1]));
      x[2] = x[2].add(h.multiply(seir[2]));
      x[3] = x[3].add(h.multiply(seir[3]));
      a2.put(t, x);
    }
    return a2;
  }

  private BigDecimal[] SEIR_model(BigDecimal beta, BigDecimal gamma, BigDecimal a, BigDecimal t,
      BigDecimal[] x) {
    BigDecimal S = x[0];
    BigDecimal E = x[1];
    BigDecimal I = x[2];
    BigDecimal R = x[3];
    BigDecimal[] newVector = new BigDecimal[] {//
        beta.multiply(BigDecimal.valueOf(-1)).multiply(S.multiply(I)), //
        beta.multiply(S.multiply(I)).subtract(a.multiply(E)), //
        a.multiply(E).subtract(gamma.multiply(I)), //
        gamma.multiply(I)//
    };

    return newVector;
  }

  private Map<BigDecimal, BigDecimal[]> seirSimulation(BigDecimal beta, BigDecimal gamma,
      BigDecimal a, BigDecimal E0, BigDecimal I0, BigDecimal days, BigDecimal step) {
    if (step == null) {
      step = BigDecimal.valueOf(0.0);
    }
    BigDecimal[] x0 = new BigDecimal[] {ONE.subtract(E0).subtract(I0), E0, I0, ZERO};
    return euler_method(beta, gamma, a, ZERO, x0, days, step);

    // private void diagram(simulation):
    // import matplotlib.pyplot
    //
    // as plot
    // plot.style.use('fivethirtyeight')figure,axes=plot.subplots()figure.subplots_adjust(bottom=0.15)axes.grid(linestyle=':',linewidth=2.0,color="#808080")t,x=
    //
    // zip(*simulation())
    // S,E,I,R = zip(*x)
    // axes.plot(t,S, color = "#0000cc")
    // axes.plot(t,E, color = "#ffb000", linestyle = '--')
    // axes.plot(t,I, color = "#a00060")
    // axes.plot(t,R, color = "#008000", linestyle = '--')
    // plot.show();
  }

  private Map<BigDecimal, BigDecimal[]> simulation1() {
    BigDecimal N = BigDecimal.valueOf(83200000L); // Einwohnerzahl von Deutschland 2019/2020
    BigDecimal R0 = BigDecimal.valueOf(2.4);
    BigDecimal gamma = BigDecimal.valueOf(1 / 3.0);
    BigDecimal beta = R0.multiply(gamma);
    BigDecimal a = BigDecimal.valueOf(1 / 5.5);
    BigDecimal initialLatent = BigDecimal.valueOf(40000).divide(N);
    BigDecimal initialInfected = BigDecimal.valueOf(10000).divide(N);

    return seirSimulation(beta, gamma, a, initialLatent, initialInfected, BigDecimal.valueOf(365),
        BigDecimal.valueOf(0.1));
  }
  // diagram(simulation1)

}
