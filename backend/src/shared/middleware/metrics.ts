import { NextFunction, Request, Response } from "express";
import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";

export const metricsRegistry = new Registry();

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "cares_"
});

const requestDuration = new Histogram({
  name: "cares_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

const requestErrors = new Counter({
  name: "cares_http_request_errors_total",
  help: "HTTP responses with status code 500 or greater",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry]
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const stopTimer = requestDuration.startTimer();

  res.once("finish", () => {
    const labels = {
      method: req.method,
      route: req.route?.path ?? req.path,
      status_code: String(res.statusCode)
    };
    stopTimer(labels);

    if (res.statusCode >= 500) {
      requestErrors.inc(labels);
    }
  });

  next();
}
