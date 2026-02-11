import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770777612121 implements MigrationInterface {
    name = 'InitialSchema1770777612121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "full_name" character varying NOT NULL, "profileData" jsonb NOT NULL DEFAULT '{}', "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users" ("role") `);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "slug" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "location" character varying NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft', CONSTRAINT "UQ_05bd884c03d3f424e2204bd14cd" UNIQUE ("slug"), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_events_slug" ON "events" ("slug") `);
        await queryRunner.query(`CREATE INDEX "idx_events_start_time" ON "events" ("start_time") `);
        await queryRunner.query(`CREATE INDEX "idx_events_status" ON "events" ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."order_reservations_status_enum" AS ENUM('active', 'completed', 'expired', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "order_reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "ticket_type_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "status" "public"."order_reservations_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_a6287de76ce42904274b53738f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_reservations_status_expires" ON "order_reservations" ("status", "expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_reservations_user_ticket" ON "order_reservations" ("user_id", "ticket_type_id") `);
        await queryRunner.query(`CREATE TABLE "ticket_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "event_id" uuid NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "quantity" integer NOT NULL, "max_per_order" integer NOT NULL DEFAULT '10', CONSTRAINT "PK_5510ce7e18a4edc648c9fbfc283" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_ticket_types_event_id" ON "ticket_types" ("event_id") `);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "order_id" uuid NOT NULL, "ticket_type_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_method_enum" AS ENUM('credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cash')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'success', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "order_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "payment_method" "public"."payments_payment_method_enum" NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "transaction_id" character varying NOT NULL, "payment_time" TIMESTAMP, CONSTRAINT "UQ_b2f7b823a21562eeca20e72b006" UNIQUE ("order_id"), CONSTRAINT "UQ_3c324ca49dabde7ffc0ef64675d" UNIQUE ("transaction_id"), CONSTRAINT "REL_b2f7b823a21562eeca20e72b00" UNIQUE ("order_id"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_payments_order_id" ON "payments" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "idx_payments_transaction_id" ON "payments" ("transaction_id") `);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'paid', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "total_amount" numeric(10,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_orders_user_id" ON "orders" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders" ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('active', 'used', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "order_id" uuid NOT NULL, "ticket_type_id" uuid NOT NULL, "ticket_code" character varying NOT NULL, "qr_data" text NOT NULL, "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "UQ_40e7b62bf74bc61a7d74d682936" UNIQUE ("ticket_code"), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_tickets_order_id" ON "tickets" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "idx_tickets_code" ON "tickets" ("ticket_code") `);
        await queryRunner.query(`ALTER TABLE "order_reservations" ADD CONSTRAINT "FK_b59347dbb2a954267dd45fa6903" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_reservations" ADD CONSTRAINT "FK_265476dabc93c00cb8f959884df" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_types" ADD CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_41292b9bdd561fb442a064705d7" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_bd5636236f799b19f132abf8d70" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_a95369aeea12da7fde110e95e00" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_a95369aeea12da7fde110e95e00"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_bd5636236f799b19f132abf8d70"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_41292b9bdd561fb442a064705d7"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "ticket_types" DROP CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20"`);
        await queryRunner.query(`ALTER TABLE "order_reservations" DROP CONSTRAINT "FK_265476dabc93c00cb8f959884df"`);
        await queryRunner.query(`ALTER TABLE "order_reservations" DROP CONSTRAINT "FK_b59347dbb2a954267dd45fa6903"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tickets_code"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tickets_order_id"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_orders_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_orders_user_id"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_payments_transaction_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_payments_order_id"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_method_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ticket_types_event_id"`);
        await queryRunner.query(`DROP TABLE "ticket_types"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reservations_user_ticket"`);
        await queryRunner.query(`DROP INDEX "public"."idx_reservations_status_expires"`);
        await queryRunner.query(`DROP TABLE "order_reservations"`);
        await queryRunner.query(`DROP TYPE "public"."order_reservations_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_events_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_events_start_time"`);
        await queryRunner.query(`DROP INDEX "public"."idx_events_slug"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_role"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
