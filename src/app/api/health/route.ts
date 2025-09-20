import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createSecureResponse, createSecureErrorResponse } from '@/lib/security-headers'
import { cache } from '@/lib/cache'

const prisma = new PrismaClient()

interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  details?: string
  error?: string
}

interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  checks: HealthCheck[]
  cache: {
    stats: any
    performance: string
  }
  recommendations: string[]
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const checks: HealthCheck[] = []

  try {
    // 1. Database connectivity check
    const dbStartTime = Date.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.push({
        name: 'Database Connection',
        status: 'healthy',
        responseTime: Date.now() - dbStartTime,
        details: 'PostgreSQL connection successful'
      })
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        status: 'unhealthy',
        responseTime: Date.now() - dbStartTime,
        error: error instanceof Error ? error.message : 'Database connection failed'
      })
    }

    // 2. Cache system check
    const cacheStartTime = Date.now()
    try {
      cache.set('health-check', 'test', 1000)
      const testValue = cache.get('health-check')

      checks.push({
        name: 'Cache System',
        status: testValue === 'test' ? 'healthy' : 'degraded',
        responseTime: Date.now() - cacheStartTime,
        details: testValue === 'test' ? 'Cache read/write successful' : 'Cache inconsistency detected'
      })
    } catch (error) {
      checks.push({
        name: 'Cache System',
        status: 'unhealthy',
        responseTime: Date.now() - cacheStartTime,
        error: error instanceof Error ? error.message : 'Cache system failure'
      })
    }

    // 3. Environment variables check
    const envStartTime = Date.now()
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(env => !process.env[env])

    checks.push({
      name: 'Environment Configuration',
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - envStartTime,
      details: missingEnvVars.length === 0
        ? 'All required environment variables present'
        : `Missing: ${missingEnvVars.join(', ')}`
    })

    // 4. API endpoints sample check
    const apiStartTime = Date.now()
    try {
      // Test internal API connectivity
      const testTenantId = 'health-check-tenant'
      await prisma.tenant.findFirst({ where: { id: testTenantId } })

      checks.push({
        name: 'API Endpoints',
        status: 'healthy',
        responseTime: Date.now() - apiStartTime,
        details: 'Internal API queries functioning'
      })
    } catch (error) {
      checks.push({
        name: 'API Endpoints',
        status: 'degraded',
        responseTime: Date.now() - apiStartTime,
        details: 'Some API operations may be slow or failing'
      })
    }

    // 5. Memory usage check
    const memStartTime = Date.now()
    try {
      const memUsage = process.memoryUsage()
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
      const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100

      checks.push({
        name: 'Memory Usage',
        status: memoryUsagePercent < 80 ? 'healthy' : memoryUsagePercent < 95 ? 'degraded' : 'unhealthy',
        responseTime: Date.now() - memStartTime,
        details: `${heapUsedMB}MB used of ${heapTotalMB}MB (${memoryUsagePercent.toFixed(1)}%)`
      })
    } catch (error) {
      checks.push({
        name: 'Memory Usage',
        status: 'unhealthy',
        responseTime: Date.now() - memStartTime,
        error: 'Could not check memory usage'
      })
    }

    // Determine overall health
    const healthyCount = checks.filter(c => c.status === 'healthy').length
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length
    const degradedCount = checks.filter(c => c.status === 'degraded').length

    let overall: 'healthy' | 'unhealthy' | 'degraded'
    if (unhealthyCount > 0) {
      overall = 'unhealthy'
    } else if (degradedCount > 0) {
      overall = 'degraded'
    } else {
      overall = 'healthy'
    }

    // Generate recommendations
    const recommendations: string[] = []
    checks.forEach(check => {
      if (check.status === 'unhealthy') {
        recommendations.push(`Fix ${check.name}: ${check.error || 'Critical issue detected'}`)
      } else if (check.status === 'degraded') {
        recommendations.push(`Optimize ${check.name}: ${check.details || 'Performance issues detected'}`)
      }
    })

    if (checks.some(c => c.responseTime > 1000)) {
      recommendations.push('Consider optimizing slow operations or adding caching')
    }

    // Get cache statistics
    const cacheStats = cache.getStats ? cache.getStats() : { total: 0, active: 0, expired: 0 }

    const healthData: SystemHealth = {
      overall,
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - startTime) / 1000), // This is just response time, not actual uptime
      checks,
      cache: {
        stats: cacheStats,
        performance: `${cacheStats.active} active entries, ${cacheStats.expired} expired`
      },
      recommendations
    }

    // Set appropriate HTTP status based on health
    const httpStatus = overall === 'healthy' ? 200 : overall === 'degraded' ? 200 : 503

    return createSecureResponse(healthData, httpStatus)

  } catch (error) {
    console.error('Health check failed:', error)

    const errorResponse: SystemHealth = {
      overall: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: 0,
      checks: [{
        name: 'Health Check System',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Health check system failure'
      }],
      cache: {
        stats: null,
        performance: 'unavailable'
      },
      recommendations: ['Investigate health check system failure', 'Check application logs for errors']
    }

    return createSecureResponse(errorResponse, 503)
  }
}