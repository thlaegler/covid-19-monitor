package com.covid19.service;

public class InterpolationModel {

  public static final double INCREMENT = 1E-4;

  public double interpolateReproductionNumber() {
    return integral(0, 2, x -> {
      return Math.pow(x, 2);
    });
  }

  private double integral(double a, double b, InterpolateFunction function) {
    double area = 0;
    double modifier = 1;
    if (a > b) {
      double tempA = a;
      a = b;
      b = tempA;
      modifier = -1;
    }
    for (double i = a + INCREMENT; i < b; i += INCREMENT) {
      double dFromA = i - a;
      area += (INCREMENT / 2) * (function.f(a + dFromA) + function.f(a + dFromA - INCREMENT));
    }
    return (Math.round(area * 1000.0) / 1000.0) * modifier;
  }

}
