output "app_url" {
  value = "http://${aws_eip.app.public_ip}"
}

output "ssh_connection" {
  value = "ssh -i civil-registry-key.pem ubuntu@${aws_eip.app.public_ip}"
}

output "public_ip" {
  value = aws_eip.app.public_ip
}

output "s3_backup_bucket" {
  value = aws_s3_bucket.backups.bucket
}
