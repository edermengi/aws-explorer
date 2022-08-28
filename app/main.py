import csv
from dataclasses import asdict

import envs
import providers

if __name__ == '__main__':

    profiles = envs.AWS_PROFILES.split(',')
    regions = envs.AWS_REGIONS.split(',')

    for profile in profiles:
        for rno, region in enumerate(regions):
            providers.configure(profile, region)
            with open(f'../ui/public/{profile}-{region}.local.csv', 'w', newline='') as f:
                fieldnames = ['type', 'name']
                writer = csv.DictWriter(f, fieldnames=fieldnames)

                for provider_class in providers.PROVIDER_CLASSES:
                    # include global resource into the first region file
                    if rno and provider_class.is_aws_global:
                        continue
                    provider = provider_class()
                    for res in provider.resources():
                        writer.writerow(asdict(res))
