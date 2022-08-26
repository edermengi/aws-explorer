import csv
from dataclasses import asdict

import providers

if __name__ == '__main__':
    with open('../ui/public/data.local.csv', 'w', newline='') as f:
        fieldnames = ['type', 'name']
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        for provider_class in providers.PROVIDER_CLASSES:
            provider = provider_class()
            for res in provider.resources():
                print(res)
                writer.writerow(asdict(res))
