// import { Injectable } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import {
//     anErrorOccurredWhileRetrievingServiceSubType,
//     serviceSubTypeNotFound,
//     serviceSubTypeRetrievalSuccessfully
// } from '../common/serviceSubTypeMessage';

// @Injectable()
// export class GetServiceSubTypeByIdService {
//     constructor(private readonly dataSource: DataSource) { }

//     async getServiceSubTypeById(ledgerId: number): Promise<any> {
//         try {
//             const serviceSubType = await this.dataSource.query(
//                 'SELECT * FROM serviceSubTypes WHERE id = ?',
//                 [ledgerId]
//             );

//             if (!serviceSubType[0]) {
//                 return {
//                     status: false,
//                     message: serviceSubTypeNotFound,
//                     data: null
//                 };
//             } else {
//                 return {
//                     status: true,
//                     message: serviceSubTypeRetrievalSuccessfully,
//                     data: serviceSubType
//                 };
//             }
//         } catch (error) {
//             return {
//                 status: false,
//                 message: anErrorOccurredWhileRetrievingServiceSubType,
//                 data: null,
//                 error: error.message
//             };
//         }
//     }
// }