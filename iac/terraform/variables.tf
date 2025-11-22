variable "credentials" {
  description = "Path to the GCP service account key file"
  type        = string
  sensitive   = true
  default     = "../secrets/service-account.json"
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "feisty-legend-478903-c2"
}

variable "region" {
  description = "GCP Region for resources"
  type        = string
  default     = "asia-southeast1-a"
}

variable "GKE_enable_autopilot" {
  description = "GCP Autopilot mode"
  type        = bool
  default     = false
}

variable "GKE_initial_node_count" {
  description = "GCP Initial node count"
  type        = number
  default     = 3
}

variable "network_name" {
  description = "Name of the network to use"
  type        = string
  default     = "naver-hkt-2025"
}