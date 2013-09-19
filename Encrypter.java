import java.io.IOException;
import java.io.FileReader;
import java.io.StringReader;
import java.util.Enumeration;
import java.security.SecureRandom;
import org.bouncycastle.asn1.ASN1InputStream;
import org.bouncycastle.asn1.ASN1Sequence;
import org.bouncycastle.asn1.DERBitString;
import org.bouncycastle.asn1.x509.RSAPublicKeyStructure;
import org.bouncycastle.crypto.InvalidCipherTextException;
import org.bouncycastle.crypto.encodings.OAEPEncoding;
import org.bouncycastle.crypto.engines.RSAEngine;
import org.bouncycastle.crypto.params.ParametersWithRandom;
import org.bouncycastle.crypto.params.RSAKeyParameters;
import org.bouncycastle.util.encoders.Hex;
import org.bouncycastle.util.io.pem.PemObject;
import org.bouncycastle.util.io.pem.PemReader;

@SuppressWarnings("deprecation")
public class Encrypter {

  public static void main (String[] args)
      throws IOException, InvalidCipherTextException {
    if (args.length != 3) {
      System.out.println("Usage: java Encrypter publickey.pem randomseed data");
      System.exit(1);
    }
    
    String filename = args[0];
    String randomseed = args[1];
    String plaintext = args[2].replaceAll("\\\\n", "\n");
    
    try {
      FileReader file = new FileReader(filename);
      
      PemReader reader = null;
      PemObject pem;
      try {
        reader = new PemReader(file);
        pem = reader.readPemObject();
      } finally {
        if (reader != null) {
          reader.close();
        }
      }

      ASN1InputStream stream = new ASN1InputStream(pem.getContent());
      ASN1Sequence seq = (ASN1Sequence) stream.readObject();

      Enumeration enm = seq.getObjects();
      enm.nextElement();

      stream = new ASN1InputStream(
          ((DERBitString) enm.nextElement()).getBytes());
      seq = (ASN1Sequence) stream.readObject();
      if (stream != null) {
        stream.close();
      }
      
      RSAPublicKeyStructure pks = new RSAPublicKeyStructure(seq);
      RSAKeyParameters key = new RSAKeyParameters(false, pks.getModulus(),
          pks.getPublicExponent());
      
      SecureRandomWrapper random = new SecureRandomWrapper(
              randomseed.getBytes("UTF-8"));

      OAEPEncoding engine = new OAEPEncoding(new RSAEngine());
      engine.init(true, new ParametersWithRandom(key, random));

      byte[] data = plaintext.getBytes("UTF-8");
      int bsz = engine.getInputBlockSize();
      try {
        byte[] res = Hex.encode(engine.processBlock(data, 0,
            Math.min(bsz, data.length)));

        System.out.println(new String(res, "UTF-8"));
      
      }
      catch(InvalidCipherTextException e) {
        throw e;
      }
      
    }
    catch (IOException e) {
      throw e;
    }
    
  }
}

class SecureRandomWrapper extends SecureRandom {

  private byte[] next;
  private byte[] last;

  public SecureRandomWrapper() {
  }

  public SecureRandomWrapper(byte[] next) {
    setNextBytes(next);
  }

  @Override
  public void nextBytes(byte[] bytes) {
    if (next != null) {
      if (bytes.length != next.length) {
        throw new IllegalArgumentException(
            "bytes.length != next.length");
      }
      System.arraycopy(next, 0, bytes, 0, next.length);
      last = next;
      next = null;
    } else {
      super.nextBytes(bytes);
      last = new byte[bytes.length];
      System.arraycopy(bytes, 0, last, 0, bytes.length);
    }
  }

  public final void setNextBytes(byte[] bytes) {
    next = bytes == null ? null : Hex.decode(bytes);
  }

  public byte[] getLastBytes() {
    return last == null ? null : Hex.encode(last);
  }
}
