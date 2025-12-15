import { describe, it, expect } from 'vitest';
import { mergeProfiles } from './profileMerger';
import { AnalysisItem, PassportData, DiplomaData, SnilsData } from '../types';

// Mock Data Helpers
const createMockItem = (id: string, data: any): AnalysisItem => ({
    fileId: id,
    fileName: `file-${id}.jpg`,
    data: data,
});

describe('mergeProfiles Business Logic', () => {

    it('should return a default empty profile when input is empty', () => {
        const result = mergeProfiles([]);
        expect(result.fullName).toBe('Неизвестный кандидат');
        expect(result.passport.data).toBeNull();
        expect(result.diploma.data).toBeNull();
    });

    it('should correctly process a single Passport', () => {
        const passportData: PassportData = {
            type: 'passport',
            lastName: 'Ivanov',
            firstName: 'Ivan',
            middleName: 'Ivanovich',
            seriesNumber: '1234 567890',
            issuedBy: 'MVD',
            dateIssued: '01.01.2020',
            departmentCode: '123-456',
            birthDate: '01.01.1990',
            birthPlace: 'Moscow',
            registrationCity: 'Moscow',
            registrationStreet: 'Lenina',
            registrationHouse: '1',
            registrationFlat: '1',
            registrationDate: '01.01.2020',
            snils: null
        };

        const result = mergeProfiles([createMockItem('1', passportData)]);

        expect(result.fullName).toBe('Ivanov Ivan Ivanovich');
        expect(result.passport.data).toEqual(passportData);
        expect(result.passport.sourceFileId).toBe('1');
    });

    it('should merge Standalone SNILS into Passport data', () => {
        const passportData = {
            type: 'passport',
            lastName: 'Ivanov',
            firstName: 'Ivan',
            middleName: 'Ivanovich',
            snils: null // Empty in passport
        } as PassportData;

        const snilsData: SnilsData = {
            type: 'snils',
            lastName: 'Ivanov',
            firstName: 'Ivan',
            middleName: 'Ivanovich',
            snils: '111-222-333 44'
        };

        const result = mergeProfiles([
            createMockItem('1', passportData),
            createMockItem('2', snilsData)
        ]);

        expect(result.passport.data?.snils).toBe('111-222-333 44');
        expect(result.fullName).toBe('Ivanov Ivan Ivanovich');
    });

    it('should create a partial passport record if only SNILS is provided', () => {
        const snilsData: SnilsData = {
            type: 'snils',
            lastName: 'Petrov',
            firstName: 'Petr',
            middleName: 'Petrovich',
            snils: '999-000-999 00'
        };

        const result = mergeProfiles([createMockItem('1', snilsData)]);

        expect(result.passport.data).not.toBeNull();
        expect(result.passport.data?.lastName).toBe('Petrov');
        expect(result.passport.data?.snils).toBe('999-000-999 00');
        expect(result.fullName).toBe('Petrov Petr Petrovich');
    });

    it('should overwrite old data with new data if new data is not empty', () => {
        const oldPassport = {
            type: 'passport',
            lastName: 'OldName',
            firstName: 'OldFirst',
            seriesNumber: '0000 000000'
        } as PassportData;

        const newPassport = {
            type: 'passport',
            lastName: 'NewName',
            firstName: 'NewFirst',
            seriesNumber: '1111 111111'
        } as PassportData;

        const result = mergeProfiles([
            createMockItem('1', oldPassport),
            createMockItem('2', newPassport)
        ]);

        expect(result.passport.data?.lastName).toBe('NewName');
        expect(result.passport.data?.seriesNumber).toBe('1111 111111');
        expect(result.passport.sourceFileId).toBe('2');
    });

    it('should NOT overwrite existing data if new data is empty/null', () => {
        const oldPassport = {
            type: 'passport',
            lastName: 'CorrectName',
            seriesNumber: '123456'
        } as PassportData;

        const sparsePassport = {
            type: 'passport',
            lastName: '', // Empty string
            seriesNumber: null // Null
        } as unknown as PassportData;

        const result = mergeProfiles([
            createMockItem('1', oldPassport),
            createMockItem('2', sparsePassport)
        ]);

        expect(result.passport.data?.lastName).toBe('CorrectName');
        expect(result.passport.data?.seriesNumber).toBe('123456');
    });

});