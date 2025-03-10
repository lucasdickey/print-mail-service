declare module 'lob' {
  interface LobAddress {
    name: string;
    address_line1: string;
    address_line2?: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    address_country: string;
  }

  interface LobLetterOptions {
    description: string;
    to: LobAddress;
    from: LobAddress;
    file: string;
    color?: boolean;
    double_sided?: boolean;
    address_placement?: string;
    mail_type?: string;
  }

  interface LobLetterResponse {
    id: string;
    tracking_number?: string;
    expected_delivery_date?: string;
    [key: string]: any;
  }

  interface LobLettersAPI {
    create(options: LobLetterOptions): Promise<LobLetterResponse>;
  }

  interface LobAPI {
    letters: LobLettersAPI;
  }

  export default function Lob(apiKey: string): LobAPI;
}
