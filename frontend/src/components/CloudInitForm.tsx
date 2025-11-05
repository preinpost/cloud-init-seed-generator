import { useState } from 'react'

interface CloudInitData {
  user_data: string
  meta_data: string
  network_config: string
  include_network: boolean
}

// 랜덤 문자열 생성 함수 (최대 8자리)
const generateRandomId = (length: number = 8): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function CloudInitForm() {
  const randomId = generateRandomId(8)
  const [formData, setFormData] = useState<CloudInitData>({
    user_data: `#cloud-config
users:
  - name: ubuntu
    ssh_authorized_keys:
      - ssh-rsa AAAAB3NzaC1yc2E...
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    groups: sudo
    shell: /bin/bash

packages:
  - curl
  - ca-certificates

chpasswd:
  list: |
    ubuntu:ubuntu
  expire: False
ssh_pwauth: True

runcmd:
  - echo "Cloud-init setup complete" > /tmp/cloud-init-done`,
    meta_data: `instance-id: i-${randomId}
local-hostname: instance-${randomId}`,
    network_config: `version: 2
ethernets:
  eth0:
    dhcp4: true`,
    include_network: false
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Create a blob from the response and trigger download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'seed.iso'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CloudInitData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="user_data" className="block text-sm font-semibold text-gray-700">
          User Data (cloud-config):
        </label>
        <textarea
          id="user_data"
          value={formData.user_data}
          onChange={(e) => handleInputChange('user_data', e.target.value)}
          rows={15}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm bg-gray-50"
          placeholder="Enter your cloud-config YAML here..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="meta_data" className="block text-sm font-semibold text-gray-700">
          Meta Data:
        </label>
        <textarea
          id="meta_data"
          value={formData.meta_data}
          onChange={(e) => handleInputChange('meta_data', e.target.value)}
          rows={4}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm bg-gray-50"
          placeholder="Enter instance metadata..."
        />
      </div>

      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <input
          type="checkbox"
          id="include_network"
          checked={formData.include_network}
          onChange={(e) => handleInputChange('include_network', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label htmlFor="include_network" className="text-sm font-medium text-gray-700 cursor-pointer">
          Include Network Configuration
        </label>
      </div>

      {formData.include_network && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <label htmlFor="network_config" className="block text-sm font-semibold text-gray-700">
            Network Configuration:
          </label>
          <textarea
            id="network_config"
            value={formData.network_config}
            onChange={(e) => handleInputChange('network_config', e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm bg-gray-50"
            placeholder="Enter network configuration YAML..."
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating ISO...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Generate ISO</span>
          </>
        )}
      </button>
    </form>
  )
}