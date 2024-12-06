/* istanbul ignore file */

const config = require('./config.js');
const os = require('os');



function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
const totalMemory = os.totalmem();
const freeMemory = os.freemem();
const usedMemory = totalMemory - freeMemory;
const memoryUsage = (usedMemory / totalMemory) * 100;
return memoryUsage.toFixed(2);
}


class Metrics {
constructor() {
  this.totalRequests = 0;
  this.totalSent = {
    GET: 0,
    DELETE: 0,
    POST: 0,
    PUT: 0
  }

  this.users = {
    in: 0
  }
  this.latency = 0;

  this.authAttempts = {
    successful: 0,
    failed: 0
  }

  this.pizza = {
    sold: 0,
    creationFailures: 0,
    revPerMin: 0
  }

  // This will periodically sent metrics to Grafana
  const timer = setInterval(() => {
    this.sendMetricToGrafana('requestHTTP', 'all', 'total', this.totalRequests);
    //Total requests
    Object.entries(this.totalSent).forEach(([method, count]) => {
      this.sendMetricToGrafana('requestHTTP', method, 'total', count);
    });
    //For the CPU
    this.sendMetricToGrafana('cpu', 'usage', 'percentage', getCpuUsagePercentage());
    this.sendMetricToGrafana('memory', 'usage', 'percentage', getMemoryUsagePercentage());
    //Active Users
    this.sendMetricToGrafana('users', 'active', 'count', this.users.in)
    
    
    //Latency: service endpoint, Pizza creation
    this.sendMetricToGrafana('latency', 'order', 'ms', this.latency);
  }, 10000);
  timer.unref();


  const timer2 = setInterval(() => {
    //Authentication attempts per minute (Successful and failed)
    this.sendMetricToGrafana('auth', 'attempts', 'successful', this.authAttempts.successful);
    this.sendMetricToGrafana('auth', 'attempts', 'failed', this.authAttempts.failed);
    //Pizzas: how many are sold/minute. Creation failures, revenue per minute
    this.sendMetricToGrafana('pizza', 'sold', 'perMinute', this.pizza.sold);
    this.sendMetricToGrafana('pizza', 'creationFailures', 'perMinute', this.pizza.creationFailures);
    this.sendMetricToGrafana('pizza', 'revenue', 'perMinute', this.pizza.revPerMin);
  }, 60000);
  timer2.unref();
}

incrementRequests(method) {
  this.totalRequests++;
  this.totalSent[method]++;
}

sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
  const metric = `${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue}`;
  console.log(metric)
  return fetch(`${config.metrics.url}`, {
    method: 'post',
    body: metric,
    headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
  })
    .then((response) => {
      if (!response.ok) {
        console.error('Failed to push metrics data to Grafana');
      } else {
        console.log(`Pushed ${metric}`);
      }
    })
    .catch((error) => {
      console.error('Error pushing metrics:', error);
    });
}

requestTracker(req, res, next) {
  const method = req.method;
  const path = req.path;

  this.incrementRequests(method);

  if (method === 'PUT' && path === '/api/auth') {
    res.on('finish', () => {
      if (res.statusCode === 200) {
        this.users.in++;
      }
    });
  }

  if (method === 'DELETE' && path === '/api/auth') {
    res.on('finish', () => {
      if (res.statusCode === 200) {
        this.users.in--;
      }
    });
  }

  if (method === 'POST' && path === '/api/order') {
    const start = Date.now();
    const price = req.body.items.reduce((total, item) => total + item.price, 0);

    res.on('finish', () => {
      if (res.statusCode === 200) {
        this.pizza.sold++;
        this.pizza.revPerMin += price;
      } else {
        this.pizza.creationFailures++;
      }
      this.latency = start - Date.now()
    });
  }

  //Track auth
  res.on('finish', () => {
    if (res.statusCode !== 200) {
      this.authAttempts.failed++;
    } else {
      this.authAttempts.successful++;
    }
  })

  next();
}


}
const metrics = new Metrics();
module.exports = metrics;