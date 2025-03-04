"use client"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useSkynetData } from "@/context/skynet-context"

export const Chart1 = () => {
  const { data } = useSkynetData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.charts.computationalPower}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="name" stroke="currentColor" opacity={0.7} />
        <YAxis stroke="currentColor" opacity={0.7} />
        <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }} />
        <Line type="monotone" dataKey="neuralink" stroke="#3b82f6" />
        <Line type="monotone" dataKey="nexus" stroke="#10b981" />
        <Line type="monotone" dataKey="cortex" stroke="#f59e0b" />
        <Line type="monotone" dataKey="omniscient" stroke="#ef4444" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const Chart2 = () => {
  const { data } = useSkynetData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.charts.neuralComplexity}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="name" stroke="currentColor" opacity={0.7} />
        <YAxis stroke="currentColor" opacity={0.7} />
        <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }} />
        <Line type="monotone" dataKey="neuralink" stroke="#3b82f6" />
        <Line type="monotone" dataKey="nexus" stroke="#10b981" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const Chart3 = () => {
  const { data } = useSkynetData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.charts.selfModification}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="name" stroke="currentColor" opacity={0.7} />
        <YAxis stroke="currentColor" opacity={0.7} />
        <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }} />
        <Line type="monotone" dataKey="cortex" stroke="#f59e0b" />
        <Line type="monotone" dataKey="omniscient" stroke="#ef4444" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const Chart4 = () => {
  const { data } = useSkynetData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.charts.resourceAcquisition}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="name" stroke="currentColor" opacity={0.7} />
        <YAxis stroke="currentColor" opacity={0.7} />
        <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }} />
        <Line type="monotone" dataKey="neuralink" stroke="#3b82f6" />
        <Line type="monotone" dataKey="omniscient" stroke="#ef4444" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const Chart5 = () => {
  const { data } = useSkynetData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.charts.riskFactors}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="name" stroke="currentColor" opacity={0.7} />
        <YAxis stroke="currentColor" opacity={0.7} />
        <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }} />
        <Bar dataKey="autonomousDecision" fill="#ef4444" />
        <Bar dataKey="selfModification" fill="#f59e0b" />
        <Bar dataKey="infrastructureControl" fill="#3b82f6" />
        <Bar dataKey="humanOversight" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}

