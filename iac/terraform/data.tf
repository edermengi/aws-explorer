data "aws_region" "current" {}
data "aws_api_gateway_rest_api" "master_api_gateway" {
  name = var.master_api_gateway
}