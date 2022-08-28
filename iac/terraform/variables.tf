variable "profile" {
  type = string
}

variable "region" {
  type = string
}

variable "environment" {
  type    = string
}

variable "asset" {
  type    = string
}

variable "application_name" {
  type    = string
  default = "aws-navigator"
}

variable "aws_cli_execution_command" {
  type    = string
  default = "aws"
}

variable "log_retention_in_days" {
  type    = number
  default = 7
}

variable "master_api_gateway" {
  type = string
}