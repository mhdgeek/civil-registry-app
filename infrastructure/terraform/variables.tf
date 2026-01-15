variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "civil-registry.example.com"
}

variable "create_dns" {
  description = "Whether to create Route53 DNS records"
  type        = bool
  default     = false
}
