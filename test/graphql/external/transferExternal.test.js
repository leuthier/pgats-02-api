const request = require('supertest');
const { expect } = require('chai');

describe('GraphQL - Transfer - External', () => {

    let token;
    before(async () => {
        const loginMutation = require('../fixture/requisicoes/login/user.json');
        const resposta = await request('http://localhost:4000/graphql')
            .post('')
            .send(loginMutation)
        token = resposta.body.data.loginUser.token;
    });

    it('Validar que é possível transferir grana entre duas contas', async () => {
        const transferMutation = require('../fixture/requisicoes/transfer/success.json');
        const respostaTransferencia = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(transferMutation);
        expect(respostaTransferencia.status).to.equal(200);
    });

    it('Deve retornar erro ao tentar transferir com saldo insuficiente', async () => {
        const insufficientBalanceMutation = require('../fixture/requisicoes/transfer/insufficient_balance.json');
        const respostaTransferencia = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(insufficientBalanceMutation);
        expect(respostaTransferencia.body.errors[0].message).to.match(/saldo insuficiente/i);
    });

    it('Não deve permitir transferir valores acima de 5000 apenas para usuário não favorecido', async () => {
        const notFavoredTransferMutation = require('../fixture/requisicoes/transfer/not_favored.json');
        const respostaTransferenciaNaoFavored = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(notFavoredTransferMutation);
        expect(respostaTransferenciaNaoFavored.body.errors[0].message).to.match(/Transferência acima de R\$ 5\.000,00 só/i);
    });

    it('Deve transferir valores acima de 5000 para usuário favorecido', async () => {
        const favoredTransferMutation = require('../fixture/requisicoes/transfer/favored.json');
        const respostaTransferenciaFavored = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(favoredTransferMutation);
        expect(respostaTransferenciaFavored.body.data.createTransfer.value).to.equal(5001);
    });
});