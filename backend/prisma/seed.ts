import { PrismaClient } from "@prisma/client";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcrypt';
import Logger from '../src/utils/logger';

const prisma = new PrismaClient();

async function main() {
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const userHash = await bcrypt.hash('User123!', 10);
    
    const admin = await prisma.users.upsert({
        where: { email: 'admin@frontrow.test' },
        update: {},
        create: {
            email: 'admin@frontrow.test',
            password: adminHash,
            first_name: 'Admin',
            last_name: 'User',
            street: 'Admin Street',
            house_number: '1',
            postal_code: '1234AB',
            city: 'Admin City',
            role: 'Admin'
        }
    });
    
    const user = await prisma.users.upsert({
        where: { email: 'user@user.test' },
        update: {},
        create: {
            email: 'user@user.test',
            password: userHash,
            first_name: 'User',
            last_name: 'User',
            street: 'User Street',
            house_number: '2',
            postal_code: '5678CD',
            city: 'User City',
            role: 'User'
        }
    });

    await importEventsFromCSV();
}

interface CSVEvent {
    Titel: string;
    Omschrijving: string;
    Datum: string;
    Starttijd: string;
    Eindtijd: string;
    Prijs: string;
}

function parseCSV(csvContent: string): CSVEvent[] {
    const records: any[] = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ','
    });

    const events: CSVEvent[] = [];
    
    for (const record of records) {
        if (!record.Titel || !record.Datum || !record.Starttijd || !record.Eindtijd) {
            continue;
        }
        
        events.push({
            Titel: record.Titel,
            Omschrijving: record.Omschrijving || '',
            Datum: record.Datum,
            Starttijd: record.Starttijd,
            Eindtijd: record.Eindtijd,
            Prijs: record.Prijs || '0'
        });
    }

    return events;
}

async function importEventsFromCSV(csvFilePath?: string) {
    try {
        const filePath = csvFilePath || path.join(__dirname, 'events.csv');
        
        if (!fs.existsSync(filePath)) {
            Logger.warn(`CSV file not found at: ${filePath}`);
            return;
        }

        const csvContent = fs.readFileSync(filePath, 'utf-8');
        const events = parseCSV(csvContent);

        Logger.info(`Found ${events.length} events in CSV file`);

        for (const csvEvent of events) {
            try {
                const [year, month, day] = csvEvent.Datum.split('-').map(Number);
                const [startHour, startMinute] = csvEvent.Starttijd.split(':').map(Number);
                const [endHour, endMinute] = csvEvent.Eindtijd.split(':').map(Number);

                const startTime = new Date(year, month - 1, day, startHour, startMinute);
                let endTime = new Date(year, month - 1, day, endHour, endMinute);
                
                if (endTime <= startTime) {
                    endTime = new Date(year, month - 1, day + 1, endHour, endMinute);
                }

                const event = await prisma.events.upsert({
                    where: { title: csvEvent.Titel },
                    update: {
                        description: csvEvent.Omschrijving,
                        start_time: startTime,
                        end_time: endTime
                    },
                    create: {
                        title: csvEvent.Titel,
                        description: csvEvent.Omschrijving,
                        start_time: startTime,
                        end_time: endTime
                    }
                });

                const price = parseInt(csvEvent.Prijs);
                const defaultTicketCount = 100;
                
                const existingTicketBatch = await prisma.ticketBatches.findFirst({
                    where: {
                        event_id: event.id
                    }
                });

                if (existingTicketBatch) {
                    await prisma.ticketBatches.update({
                        where: {
                            id: existingTicketBatch.id
                        },
                        data: {
                            total_tickets: defaultTicketCount,
                            price: price
                        }
                    });
                } else {
                    await prisma.ticketBatches.create({
                        data: {
                            event_id: event.id,
                            total_tickets: defaultTicketCount,
                            price: price
                        }
                    });
                }

                Logger.info(`✓ Imported event: ${csvEvent.Titel}`);
            } catch (eventError) {
                Logger.error(`Error importing event "${csvEvent.Titel}":`, eventError);
            }
        }

        Logger.info('✓ CSV import completed successfully');
    } catch (error) {
        Logger.error('Error importing events from CSV:', error);
        throw error;
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        Logger.error(error);
        await prisma.$disconnect();
        process.exit(1);
    })

export { importEventsFromCSV };

if (require.main === module) {
    const csvFilePath = process.argv[2];
    if (csvFilePath) {
        Logger.info(`Importing events from: ${csvFilePath}`);
        importEventsFromCSV(csvFilePath)
            .then(() => {
                Logger.info('Import completed successfully');
                process.exit(0);
            })
            .catch((error) => {
                Logger.error('Import failed:', error);
                process.exit(1);
            });
    }
}