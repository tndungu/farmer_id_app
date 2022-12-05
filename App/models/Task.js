import { Realm, createRealmContext } from '@realm/react';

export class Task {
  constructor({id = new Realm.BSON.ObjectId(), description, isComplete = false}) {
    this.description = description;
    this.isComplete = isComplete;
    this.createdAt = new Date();
    this._id = id;
  }

  static schema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      description: 'string',
      isComplete: {type: 'bool', default: false},
      createdAt: 'date',
      project: { type : 'linkingObjects', objectType : 'Project', property: 'tasks' }
    },
  };
}
