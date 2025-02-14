# Sets global variables for this Terraform project.

variable app_name {
  default = "hotel404"
}

variable location {
  default = "westeurope"
}

variable "kubernetes_version" {
  default = "1.28.0"
}
