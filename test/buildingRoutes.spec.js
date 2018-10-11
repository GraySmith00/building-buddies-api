const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('BUILDING API ROUTES', () => {
  beforeEach((done) => {
    database.migrate.rollback()
      .then(() => {
        database.migrate.latest()
          .then(() => database.seed.run()
            .then(() => {
              done();
            }));
      });
  });

  // should get all buildings
  it('GET /api/v1/buildings should return all buildings', (done) => {
    chai
      .request(server)
      .get('/api/v1/buildings')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('address');
        res.body[0].address.should.equal('1910 S Josephine St\nDenver, CO\n');
        res.body[0].should.have.property('name');
        res.body[0].name.should.equal('Modera Observatory Park');
        done();
      });
  });

  // should get an individual building
  it('GET /api/v1/buildings/:building_id should get a building by id', (done) => {
    chai
      .request(server)
      .get('/api/v1/buildings/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('address');
        res.body[0].address.should.equal('1910 S Josephine St\nDenver, CO\n');
        res.body[0].should.have.property('name');
        res.body[0].name.should.equal('Modera Observatory Park');
        done();
      });
  });

  // should return a 404 if the building is not found
  it('GET /api/v1/buildings/:building_id should return a 404 if the building id is not found', (done) => {
    chai
      .request(server)
      .get('/api/v1/buildings/600')
      .end((err, res) => {
        res.should.have.status(404);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        done();
      });
  });

  // should create a new building
  it('POST /api/v1/buildings should create a new building', (done) => {
    chai
      .request(server)
      .post('/api/v1/buildings')
      .type('json')
      .send({
        address: '123 fake stree',
        name: 'Fake Building',
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.json;
        res.should.be.a('object');
        res.body.should.deep.equal({
          id: 241,
        });
        done();
      });
  });

  // should return a 409 if the building already exists
  it('POST /api/v1/buildings should return a 409 if the building already exists', (done) => {
    chai
      .request(server)
      .post('/api/v1/buildings')
      .type('json')
      .send({
        address: '1910 S Josephine St\nDenver, CO\n',
        name: 'Modera Observatory Park',
      })
      .end((err, res) => {
        res.should.have.status(409);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        done();
      });
  });


  // should return a 422 if the a param is missing
  it('POST /api/v1/buildings should return a 422 if there is a missing param', (done) => {
    chai
      .request(server)
      .post('/api/v1/buildings')
      .type('json')
      .end((err, res) => {
        res.should.have.status(422);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        done();
      });
  });

  // should update an existing building
  it('PUT /api/v1/buildings/:building_id should update an existing building', (done) => {
    chai
      .request(server)
      .put('/api/v1/buildings/1')
      .type('json')
      .send({
        address: '1910 S Josephine St\nDenver, CO\n',
        name: 'Modera Perrrrk',
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal({
          id: 1,
        });
        done();
      });
  });

  // should return a 404 if a building with that id was not found
  it('PUT /api/v1/buildings/:building_id should return a 404 if the building was not found', (done) => {
    chai
      .request(server)
      .put('/api/v1/buildings/600')
      .type('json')
      .send({
        address: '1910 S Josephine St\nDenver, CO\n',
        name: 'Modera Perrrrk',
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        done();
      });
  });

  // should return a 422 if the correct params were not sent
  it('PUT /api/v1/buildings/:building_id should return a 422 if the correct params were not sent', (done) => {
    chai
      .request(server)
      .put('/api/v1/buildings/1')
      .type('json')
      .send({
        address: '1910 S Josephine St\nDenver, CO\n',
        cheese: 'cheddar',
      })
      .end((err, res) => {
        res.should.have.status(422);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        done();
      });
  });

  // should delete a building
  it('DELETE /api/v1/buildings/:building_id delete a building', (done) => {
    chai
      .request(server)
      .delete('/api/v1/buildings/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        done();
      });
  });

  // should return a 404 if the building was not found
  it('DELETE /api/v1/buildings/:building_id delete a building', (done) => {
    chai
      .request(server)
      .delete('/api/v1/buildings/600')
      .end((err, res) => {
        res.should.have.status(404);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        done();
      });
  });
});
