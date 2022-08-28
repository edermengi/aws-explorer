TERRAFORM_LOCAL_PLAN = .terraform/local.plan
TERRAFORM_KEY := "aws-navigator/$(ENV)/terraform.tfstate"
TERRAFORM_CONFIG := "$(ENV).local.tfvars"
SRC_DIR = app


check-envs:
	test $(ENV)
	test $(AWS_PROFILE)
	test $(AWS_REGION)
	test $(TERRAFORM_BUCKET)
	test $(ASSET)


clean:
	rm -rf dist

package_app:
	mkdir -p dist/$(SRC_DIR)
	pip install -r $(SRC_DIR)/requirements.txt --target dist/$(SRC_DIR)
	cp -r $(SRC_DIR) dist/
	cd dist/$(SRC_DIR) && zip -r ../$(SRC_DIR).zip . -x '*test*' '*pycache*'

package:  package_app

terraform_init: check-envs
	cd "iac/terraform" && \
	terraform init \
		-backend-config="profile=$(AWS_PROFILE)" \
		-backend-config="region=$(AWS_REGION)" \
		-backend-config="bucket=$(TERRAFORM_BUCKET)" \
		-backend-config="key=$(TERRAFORM_KEY)"

terraform_plan: check-envs
	cd "iac/terraform" && \
	terraform plan \
		-var-file $(TERRAFORM_CONFIG) \
		-var "environment=$(ENV)" \
		-var "region=$(AWS_REGION)" \
		-var "profile=$(AWS_PROFILE)" \
		-var "asset=$(ASSET)" \
		-input=false -out $(TERRAFORM_LOCAL_PLAN)

terraform_apply:
	cd "iac/terraform" && \
	terraform apply $(TERRAFORM_LOCAL_PLAN)

terraform_destroy: check-envs
	cd "iac/terraform" && \
	terraform destroy \
		-var-file $(TERRAFORM_CONFIG) \
		-var "environment=$(ENV)" \
		-var "region=$(AWS_REGION)" \
		-var "profile=$(AWS_PROFILE)" \
		-var "asset=$(ASSET)"

deploy: clean package terraform_init terraform_plan terraform_apply

destroy: clean package terraform_init terraform_plan terraform_destroy

